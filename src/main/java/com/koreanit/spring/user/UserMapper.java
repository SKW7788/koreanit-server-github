// 변환은 매번 필요하지만, 변환 코드를 Service/Controller에 흩어지게 하지 않기 위해 Mapper로 고정한다.
package com.koreanit.spring.user;

import java.util.ArrayList;
import java.util.List;

import com.koreanit.spring.user.dto.response.UserResponse;

public class UserMapper {

    private UserMapper() {}

    // Entity -> Domain (단건)
    public static User toDomain(UserEntity e) {
        return User.of(
                e.getId(),
                e.getUsername(),
                e.getEmail(),
                e.getPassword(),
                e.getNickname(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    // Entity -> Domain (리스트)
    public static List<User> toDomainList(List<UserEntity> entities) {
        List<User> result = new ArrayList<>(entities.size());
        for (UserEntity e : entities) {
            result.add(toDomain(e));
        }
        return result;
    }

    // Domain -> Response DTO (단건)
    public static UserResponse toResponse(User u) {
        return UserResponse.from(u);
    }

    // Domain -> Response DTO (리스트)
    public static List<UserResponse> toResponseList(List<User> users) {
        List<UserResponse> result = new ArrayList<>(users.size());
        for (User u : users) {
            result.add(toResponse(u));
        }
        return result;
    }
}