package com.dealhub.user;

import com.dealhub.common.ApiException;
import com.dealhub.user.UserDtos.UserProfile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/users/{id}")
    public UserProfile profile(@PathVariable Long id) {
        return users.findById(id)
                .map(UserProfile::of)
                .orElseThrow(() -> ApiException.notFound("user not found"));
    }
}
