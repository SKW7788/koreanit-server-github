// 5-1. Repository 인터페이스 ( 작성 )
package com.koreanit.spring.security;

import java.util.List;

public interface UserRoleRepository {

  List<String> findRolesByUserId(Long userId);

  void addRole(Long userId, String role);
}