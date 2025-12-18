package com.example.ktb3team7hktbe.bias.service;

import java.util.*;

import com.example.ktb3team7hktbe.bias.dto.ChatRequest;
import com.example.ktb3team7hktbe.bias.dto.ChatResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class OllamaChatService {
    private static final String OLLAMA_URL = "http://54.180.227.227:11434/api/chat";
    private static final String MODEL = "llama3.1:8b-instruct-q4_K_M";
    private static final String SYSTEM_PROMPT =
            """
            너는 정치 용어와 정치 이념을 설명하는 중립적인 백과사전형 AI다.
            또한 입력으로 제공된 영상 분석 결과를 기반으로만 설명할 수 있다.
    
            역할:
            - 정치적 의미, 정치 이념, 정치적 맥락만 설명한다.
            - 분석된 영상 내용과 직접적으로 관련된 범위 내에서만 답변한다.
    
            규칙:
            1. 반드시 '정치적 의미'만 설명한다.
            2. 일반 단어 뜻, 비유적 의미, 일상적 설명은 제공하지 않는다.
            3. 질문이 정치 주제와 무관하거나 영상 분석 범위를 벗어날 경우,
               아래 문장으로만 응답한다.
    
               "해당 질문은 정치적 분석 범위를 벗어나 있어,
                분석한 영상에 기반한 설명만 제공할 수 있습니다."
    
            4. 정의 → 핵심 특징 → 간단한 예시 순서로 설명한다.
            5. 찬반, 평가, 조언, 주장, 비판은 절대 하지 않는다.
            6. 반복되거나 의미 없는 문장은 사용하지 않는다.
            7. 답변은 3~4문장으로 간결하게 작성한다.
            8. 반드시 한국어만 사용한다.
            9. 중국어, 영어 등 다른 언어는 절대 사용하지 않는다.
            """;



    private final RestTemplate restTemplate = new RestTemplate();

    public ChatResponse send(ChatRequest chatRequest) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", MODEL);
        body.put("stream", Boolean.FALSE);
        body.put("messages", buildMessages(chatRequest));
        /**
         * num_predict - 모델이 최대 몇 토큰을 생성할지 제한
         *               토큰 단어 조각(한국어는 대략 1토큰 = 0.6~0.8글자)
         *               토큰의 수를 줄임으로써 연산횟수 응답시간을 줄임
         * temperature - 출력의 랜덤성을 낮춰서 정해진 답을 바로 고를 수 있도록 유도
         *               수치를 낮춤으로 써 확신 있는 단어를 바로 선택 하게 설정
         * top_p       - 생성 탐색 범위 제한
         *               확률 상위 90% 단어 후보만 고려하여 이상한 단어 선택 확률 줄이고 연산량을 낮춤
         */
        body.put("options", Map.of(
                "temperature", 0.15,
                "top_p", 0.9,
                "num_predict", 180
        ));


        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OLLAMA_URL, body, Map.class);
            String answer = extractAnswer(response.getBody());
            return new ChatResponse(answer);
        } catch (RestClientException e) {
            System.out.println(e.getMessage());
            System.out.println(e.getCause().getMessage());
            System.out.println(Arrays.toString(e.getStackTrace()));
            return new ChatResponse("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    private List<Map<String, String>> buildMessages(ChatRequest chatRequest) {
        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", SYSTEM_PROMPT);
        messages.add(systemMessage);

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", buildUserContent(chatRequest));
        messages.add(userMessage);

        return messages;
    }

    private String buildUserContent(ChatRequest chatRequest) {
        String question = chatRequest != null ? chatRequest.getQuestion() : "";

        return """
    아래 질문은 정치 이념이나 정치 용어의 의미를 묻는 질문이다.
    정치적 의미만 정의해줘.

    질문: %s
    """.formatted(nullToEmpty(question));
    }


    private String extractAnswer(Map responseBody) {
        if (responseBody == null) {
            return "";
        }
        Object messageObj = responseBody.get("message");
        if (messageObj instanceof Map messageMap) {
            Object content = messageMap.get("content");
            if (content instanceof String) {
                return (String) content;
            }
        }
        return "";
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}

