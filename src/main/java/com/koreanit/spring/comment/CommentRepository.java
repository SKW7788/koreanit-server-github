package com.koreanit.spring.comment;

import java.util.List;

public interface CommentRepository {

    long save(long postId, long userId, String content);

    CommentEntity findById(long id);

    List<CommentEntity> findAllByPostId(long postId, Long beforeId, int limit);

    int deleteById(long id);

    int updateContent(long id, String content);

    boolean isOwner(long commentId, long userId);
}