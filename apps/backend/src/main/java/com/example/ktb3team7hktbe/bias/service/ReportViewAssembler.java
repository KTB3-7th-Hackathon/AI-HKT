package com.example.ktb3team7hktbe.bias.service;

import com.example.ktb3team7hktbe.bias.dto.FastApiResponse;
import com.example.ktb3team7hktbe.bias.dto.ReportResponse;
import com.example.ktb3team7hktbe.bias.entity.OppositeVideos;
import com.example.ktb3team7hktbe.bias.repository.OppositeVideosRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReportViewAssembler {

    private final OppositeVideosRepository oppositeVideosRepository;

    public ReportViewAssembler(OppositeVideosRepository oppositeVideosRepository) {
        this.oppositeVideosRepository = oppositeVideosRepository;
    }

    // TODO: minBias, maxBias 설정 로직 변경 필요 line 24~35
    public ReportResponse processingReport(FastApiResponse fastApiResponse) {
        int minBias;
        int maxBias;
        if (fastApiResponse.getWeight() < -20) {
            minBias = 20;
            maxBias = 30;
        } else if (fastApiResponse.getWeight() > 20) {
            minBias = -30;
            maxBias = -20;
        } else {
            minBias = -30;
            maxBias = 30;
        }
        String tag = fastApiResponse.getTag();
        List<OppositeVideos> videos = oppositeVideosRepository.findFirst2ByTagAndBiasBetween(tag, minBias, maxBias);
        List<String> urls = videos.stream().map(OppositeVideos::getUrl).toList();

        return ReportResponse.builder()
                .report(fastApiResponse.getText())
                .bias(fastApiResponse.getWeight())
                .words(fastApiResponse.getWords())
                .urls(urls)
                .build();
    }
}
