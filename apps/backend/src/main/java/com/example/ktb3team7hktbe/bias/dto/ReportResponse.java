package com.example.ktb3team7hktbe.bias.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    @JsonProperty("report")
    String report;
    @JsonProperty("bias")
    int bias;
    @JsonProperty("words")
    List<String> words;
    @JsonProperty("urls")
    List<String> urls;
}
