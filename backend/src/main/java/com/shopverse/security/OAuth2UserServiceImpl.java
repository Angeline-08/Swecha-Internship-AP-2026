package com.shopverse.security;

import com.shopverse.entity.AuthProvider;
import com.shopverse.entity.Cart;
import com.shopverse.entity.Role;
import com.shopverse.entity.User;
import com.shopverse.entity.UserSettings;
import com.shopverse.entity.Wishlist;
import com.shopverse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Optional;

@Service
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!AuthProvider.GOOGLE.equals(user.getProvider())) {
                user.setProvider(AuthProvider.GOOGLE);
                user.setGoogleId(googleId);
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .googleId(googleId)
                    .provider(AuthProvider.GOOGLE)
                    .role(Role.CUSTOMER)
                    .onboardingCompleted(false)
                    .build();
            user.setCart(Cart.builder().user(user).build());
            user.setWishlist(Wishlist.builder().user(user).build());
            user.setSettings(UserSettings.builder().user(user).build());
            userRepository.save(user);
        }

        return new DefaultOAuth2User(
                Collections.emptyList(),
                oAuth2User.getAttributes(),
                "email");
    }
}
