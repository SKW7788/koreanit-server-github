package com.koreanit.spring.user;

//import com.koreanit.spring.entity.UserEntity;
//import com.koreanit.spring.mapper.UserMapper;
//import com.koreanit.spring.repository.UserRepository;
import java.util.List;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.koreanit.spring.common.error.ApiException;
import com.koreanit.spring.common.error.ErrorCode;
import com.koreanit.spring.security.SecurityUtils;

// import com.koreanit.spring.user.dto.request.UserCreateRequest;
// import com.koreanit.spring.user.dto.request.UserEmailChangeRequest;
// import com.koreanit.spring.user.dto.request.UserNicknameChangeRequest;
// import com.koreanit.spring.user.dto.request.UserPasswordChangeRequest;
import org.springframework.dao.EmptyResultDataAccessException;

@Service
public class UserService {

  private static final int MAX_LIMIT = 1000;

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  // UserService 메서드에 @PreAuthorize 적용
  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  // @PreAuthorize 를 사용하기 위해서 Method Security 활성화
  public boolean isSelf(Long userId) {
    Long currentUserId = SecurityUtils.currentUserId();
    return currentUserId != null && userId != null && currentUserId.equals(userId);
  }

  private String toDuplicateMessage(DuplicateKeyException e) {
    String m = (e.getMessage() == null) ? "" : e.getMessage();

    // MySQL 기준: "Duplicate entry ... for key '...'"
    // DB/드라이버에 따라 메시지 포맷은 달라질 수 있으므로
    // key 이름 기반으로만 판단한다.
    if (m.contains("for key") && (m.contains("users.username") || m.contains("'username'") || m.contains("username"))) {
      return "이미 존재하는 username입니다";
    }
    if (m.contains("for key") && (m.contains("users.email") || m.contains("'email'") || m.contains("email"))) {
      return "이미 존재하는 email입니다";
    }

    return "이미 존재하는 값입니다";
  }

  // private int normalizeLimit(int limit) {
  // if (limit <= 0) {
  // //throw new IllegalArgumentException("limit 은 1 이상 입력해주세요");
  // throw new ApiException(ErrorCode,INVALID_REQUEST("limit 은 1 이상 입력해주세요");
  // }
  // return Math.min(limit, MAX_LIMIT);
  // }

  private int normalizeLimit(int limit) {
    if (limit <= 0) {
      throw new ApiException(
          ErrorCode.INVALID_REQUEST,
          "limit 은 1 이상 입력해주세요");
    }
    return Math.min(limit, MAX_LIMIT);
  }

  // public User get(Long id) {
  // UserEntity e = userRepository.findById(id);
  // return UserMapper.toDomain(e);
  // }

  @PreAuthorize("hasRole('ADMIN') or @userService.isSelf(#id)")
  public User get(Long id) {
    // ----------------------------------------------------------------------
    // 위 @PreAuthorize("hasRole('ADMIN') or @userService.isSelf(#id)") 정의되지 않으면 
    // 아래 if 문 적용해야 한다.
    // if (!id.equals(SecurityUtils.currentUserId())) {
    //   throw new ApiException(ErrorCode.FORBIDDEN);
    // }
     // ----------------------------------------------------------------------
    try {
      UserEntity e = userRepository.findById(id);
      return UserMapper.toDomain(e);

    } catch (EmptyResultDataAccessException e) {
      throw new ApiException(
          ErrorCode.NOT_FOUND_RESOURCE,
          "존재하지 않는 사용자입니다. id=" + id);
    }
  }

  @PreAuthorize("hasRole('ADMIN')")
  public List<User> list(int limit) {
    int safeLimit = normalizeLimit(limit);
    return UserMapper.toDomainList(userRepository.findAll(safeLimit));
  }

  // public void changeNickname(Long id, UserNicknameChangeRequest req) {
  // String nickname = req.getNickname();
  // userRepository.updateNickname(id, nickname);
  // }

  // public void changeNickname(Long id, UserNicknameChangeRequest req) {
  // String nickname = req.getNickname().trim().toLowerCase();
  // userRepository.updateNickname(id, nickname);
  // }

  @PreAuthorize("hasRole('ADMIN') or @userService.isSelf(#id)")
  public void changeNickname(Long id, String nickname) {
    nickname = nickname.trim().toLowerCase();

    // 1) 대상 존재 여부 확인 (없으면 여기서 404)
    User user = get(id);

    // 2) 값이 동일하면 변경 없음 → 정상 처리
    if (user.getNickname().equals(nickname)) {
      return;
    }

    // 3) 실제 변경
    int updated = userRepository.updateNickname(id, nickname);

    if (updated == 0) {
      throw new ApiException(
          ErrorCode.NOT_FOUND_RESOURCE,
          "닉네임 변경에 실패하였습니다.. id=" + id);
    }
  }

  // public void changePassword(Long id, UserPasswordChangeRequest req) {
  // String hash = passwordEncoder.encode(req.getPassword());
  // userRepository.updatePassword(id, hash);
  // }

  @PreAuthorize("hasRole('ADMIN') or @userService.isSelf(#id)")
  public void changePassword(Long id, String password) {
    // String password = req.getPassword();

    User user = get(id);

    boolean ok = passwordEncoder.matches(password, user.getPassword());

    if (ok) {
      throw new ApiException(ErrorCode.INVALID_REQUEST, "기존 비밀번호와 동일한 값은 사용할 수 없습니다.");
    }

    String passwordHash = passwordEncoder.encode(password);

    // userRepository.updatePassword(id, passwordHash);

    int updated = userRepository.updatePassword(id, passwordHash);

    if (updated != 1) {
      throw new ApiException(
          ErrorCode.INTERNAL_ERROR,
          "비밀번호 변경에 실패했습니다.");
    }

  }

  // public void delete(Long id) {
  // userRepository.deleteById(id);
  // }

  @PreAuthorize("hasRole('ADMIN') or @userService.isSelf(#id)")
  public void delete(Long id) {
    int deleted = userRepository.deleteById(id);

    if (deleted == 0) {
      throw new ApiException(
          ErrorCode.NOT_FOUND_RESOURCE,
          "존재하지 않는 사용자입니다. id=" + id);
    }
  }

  // public Long login(String username, String password) {
  // UserEntity e = userRepository.findByUsername(username);

  // boolean ok = passwordEncoder.matches(password, e.getPassword());
  // if (!ok) {
  // throw new ApiException(ErrorCode.INTERNAL_ERROR, "비밀번호 검증 실패");
  // }

  // return e.getId();
  // }

  public Long login(String username, String password) {
    username = (username == null) ? null : username.trim().toLowerCase();
    try {
      UserEntity en = userRepository.findByUsername(username);
      boolean ok = passwordEncoder.matches(password, en.getPassword());
      if (!ok) {
        throw new ApiException(ErrorCode.INVALID_REQUEST, "비밀번호가 잘못되었습니다.");
      }
      return en.getId();
    } catch (EmptyResultDataAccessException e) {
      throw new ApiException(ErrorCode.NOT_FOUND_RESOURCE, "존재하지 않는 사용자입니다. username=" + username);
    }
  }

  @PreAuthorize("hasRole('ADMIN') or @userService.isSelf(#id)")
  public void changeEmail(Long id, String email) {
    // String email = req.getEmail();
    String normalizedEmail = (email == null) ? null : email.toLowerCase();
    try {
      userRepository.updateEmail(id, normalizedEmail);
    } catch (DuplicateKeyException e) {
      throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "이미 사용 중인 이메일입니다: " + email);
    }
  }

  // public Long create(UserCreateRequest req) {
  // String username = req.getUsername().trim().toLowerCase();
  // String nickname = req.getNickname().trim().toLowerCase();
  // String email = req.getEmail().trim().toLowerCase();
  // String hash = passwordEncoder.encode(req.getPassword());

  // return userRepository.save(username, hash, nickname, email);
  // }

  // public Long create(UserCreateRequest req) {
  // String username = req.getUsername().trim().toLowerCase();
  // String nickname = req.getNickname().trim().toLowerCase();

  // String email = req.getEmail();
  // String normalizedEmail = (email == null) ? null : email.toLowerCase();

  // String hash = passwordEncoder.encode(req.getPassword());

  // return userRepository.save(username, hash, nickname, normalizedEmail);
  // }

  // 정상 흐름: 회원가입 → PK 반환
  // public Long create(UserCreateRequest req) {
  public Long create(String username, String password, String nickname, String email) {
    username = username.trim().toLowerCase();
    nickname = nickname.trim().toLowerCase();

    // String email = req.getEmail();
    String normalizedEmail = (email == null) ? null : email.toLowerCase();

    // String hash = passwordEncoder.encode(req.getPassword());
    String hash = passwordEncoder.encode(password);

    try {
      return userRepository.save(username, hash, nickname, normalizedEmail);
    } catch (DuplicateKeyException e) {
      throw new ApiException(
          ErrorCode.DUPLICATE_RESOURCE,
          toDuplicateMessage(e));
    }

  }

  // public Long create(UserCreateRequest req) {
  // String hash = passwordEncoder.encode(req.getPassword());

  // return userRepository.save(
  // req.getUsername(),
  // hash,
  // req.getNickname(),
  // req.getEmail());
  // }

}