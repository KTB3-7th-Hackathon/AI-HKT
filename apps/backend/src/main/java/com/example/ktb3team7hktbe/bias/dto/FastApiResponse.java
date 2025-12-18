package com.example.ktb3team7hktbe.bias.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class FastApiResponse {
    String text;
    List<String> words;
    int weight;
    String tag;
}
