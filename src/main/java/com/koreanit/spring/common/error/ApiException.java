// 메시지는 클라이언트 응답용 문장이다
// 로그 상세 정보는 로깅 단계에서 별도로 남긴다
package com.koreanit.spring.common.error;

public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}