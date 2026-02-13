// 변환은 매번 필요하지만, 변환 코드를 Service/Controller에 흩어지게 하지 않기 위해 Mapper로 고정한다.
package com.koreanit.spring.post;

import com.koreanit.spring.post.dto.response.PostResponse;

import java.util.ArrayList;
import java.util.List;

public class PostMapper {

    private PostMapper() {}

    // Entity -> Domain (단건)
    public static Post toDomain(PostEntity e) {
        return Post.of(
                e.getId(),
                e.getUserId(),
                e.getTitle(),
                e.getContent(),
                e.getViewCount(),
                e.getCommentsCnt(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    // Entity -> Domain (리스트)
    public static List<Post> toDomainList(List<PostEntity> entities) {
        List<Post> result = new ArrayList<>(entities.size());
        for (PostEntity e : entities) {
            result.add(toDomain(e));
        }
        return result;
    }

    // Domain -> Response DTO (단건)
    public static PostResponse toResponse(Post p) {
        return PostResponse.from(p);
    }

    // Domain -> Response DTO (리스트)
    public static List<PostResponse> toResponseList(List<Post> posts) {
        List<PostResponse> result = new ArrayList<>(posts.size());
        for (Post p : posts) {
            result.add(toResponse(p));
        }
        return result;
    }
}
