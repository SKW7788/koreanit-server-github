package com.koreanit.spring.common.error;

import org.springframework.http.HttpStatus;

// ErrorCode	          HTTP 상태 코드	    언제 쓰나 (예시)	       대표 상황 예시
//  ---------           -------------        ----------------        --------------  
// INVALID_REQUEST	    400   Bad Request    요청 형식/값이 잘못됨	   필수 파라미터 누락, 타입 불일치, 허용 범위 밖 값, JSON 파싱 실패
// NOT_FOUND_RESOURCE	404   Not Found	     대상 리소스가 없음	       GET /users/999 조회 결과 없음, DELETE /posts/10 대상 없음
// DUPLICATE_RESOURCE	409   Conflict	     유니크/중복 충돌	      회원가입 시 username 중복, 이미 존재하는 값으로 변경 시도
// INTERNAL_ERROR	    500   Internal 	     서버 내부 처리 실패	   예상하지 못한 예외, 외부 연동 실패, 로직 버그 등(일반적으로 공통 처리)
//                            Server Error

public enum ErrorCode {

    INVALID_REQUEST(HttpStatus.BAD_REQUEST),   // 400
    NOT_FOUND_RESOURCE(HttpStatus.NOT_FOUND),  // 404
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT),   // 409
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED),     // 401 
    FORBIDDEN(HttpStatus.FORBIDDEN),           // 403 
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR); // 500

    private final HttpStatus status;

    ErrorCode(HttpStatus status) {
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}