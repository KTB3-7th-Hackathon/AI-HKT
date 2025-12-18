package com.example.ktb3team7hktbe.bias.service;

import com.example.ktb3team7hktbe.bias.dto.FastApiResponse;
import com.example.ktb3team7hktbe.bias.dto.TranscriptRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class BiasReportService {

    private final RestClient restClient;

    public BiasReportService(@Value("${fastapi.base-url}") String fastApiBaseUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(60000);

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(fastApiBaseUrl)
                .build();
    }

    public FastApiResponse analyzeVideo(TranscriptRequest request) {

        return restClient.post()
                .uri("/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(FastApiResponse.class);
    }
}