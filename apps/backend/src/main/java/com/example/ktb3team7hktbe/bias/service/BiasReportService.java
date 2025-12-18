package com.example.ktb3team7hktbe.bias.service;

import com.example.ktb3team7hktbe.bias.dto.FastApiResponse;
import com.example.ktb3team7hktbe.bias.dto.TranscriptRequest;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class BiasReportService {

    private final RestClient restClient;

    // TODO: baseUrl 변경 필요
    public BiasReportService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(60000);

        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    public FastApiResponse analyzeVideo(TranscriptRequest request) {

        // TODO: FastAPI Http Method, uri 변경 필요
        return restClient.post()
                .uri("/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(FastApiResponse.class);
    }
}
