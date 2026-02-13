package com.koreanit.spring.user.dto.response;

import java.time.LocalDateTime;

import com.koreanit.spring.user.User;

public class UserResponse {
    private Long id;
    private String username;
    private String displayName;
    // UserResponse에서 password 제거 : 비밀번호는 Domain 내부 로직에서만 사용
    // private String password;
    private String email;
    private String nickname;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }

    // UserResponse에서 password 제거 : 비밀번호는 Domain 내부 로직에서만 사용
    // public String getPassword() { return password; }
    public String getEmail() {
        return email;
    }

    public String getNickname() {
        return nickname;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // domain -> dto
    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.username = u.getUsername();
        r.displayName = u.displayName();
        // UserResponse에서 password 제거 : 비밀번호는 Domain 내부 로직에서만 사용
        // r.password = u.getPassword();
        r.email = u.getEmail();
        r.nickname = u.getNickname();
        r.createdAt = u.getCreatedAt();
        return r;
    }
    // public static UserResponse from(User u) {
    // UserResponse r = new UserResponse();
    // r.id = u.getId();
    // r.username = u.getUsername();
    // r.email = u.getEmail();
    // r.displayName = u.displayName(); //
    // r.createdAt = u.getCreatedAt();
    // return r;
    // }

}