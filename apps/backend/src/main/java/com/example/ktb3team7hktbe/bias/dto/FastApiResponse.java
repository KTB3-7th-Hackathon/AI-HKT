package com.example.ktb3team7hktbe.bias.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class FastApiResponse {
    @JsonProperty("reportText")
    String text;
    @JsonProperty("sentences")
    List<String> words;
    int weight;
    String tag;
}