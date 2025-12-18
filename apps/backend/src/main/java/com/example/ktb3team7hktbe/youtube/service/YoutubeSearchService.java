package com.example.ktb3team7hktbe.youtube.service;

import com.example.ktb3team7hktbe.youtube.dto.YoutubeSearchApiResponse;
import com.example.ktb3team7hktbe.youtube.dto.YoutubeVideo;
import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class YoutubeSearchService {
    private final RestTemplate restTemplate;
    private final String apiKey;

    public YoutubeSearchService(@Value("${youtube.api-key:}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey;
    }

    public List<YoutubeVideo> search(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("YouTube API key is missing");
        }

        URI uri = UriComponentsBuilder.fromUriString("https://www.googleapis.com/youtube/v3/search")
                .queryParam("part", "snippet")
                .queryParam("maxResults", 15)
                .queryParam("type", "video")
                .queryParam("q", query)
                .queryParam("key", apiKey)
                .encode()
                .build()
                .toUri();

        YoutubeSearchApiResponse response = restTemplate.getForObject(uri, YoutubeSearchApiResponse.class);
        if (response == null || response.items() == null) {
            return Collections.emptyList();
        }

        return response.items().stream()
                .filter(item -> item != null && item.id() != null && item.id().videoId() != null)
                .map(item -> {
                    String title = Optional.ofNullable(item.snippet())
                            .map(YoutubeSearchApiResponse.Snippet::title)
                            .orElse("");
                    String channelTitle = Optional.ofNullable(item.snippet())
                            .map(YoutubeSearchApiResponse.Snippet::channelTitle)
                            .orElse("");
                    String thumbnailUrl = Optional.ofNullable(item.snippet())
                            .map(YoutubeSearchApiResponse.Snippet::thumbnails)
                            .map(this::pickThumbnail)
                            .orElse("");
                    return new YoutubeVideo(item.id().videoId(), title, channelTitle, thumbnailUrl);
                })
                .toList();
    }

    private String pickThumbnail(YoutubeSearchApiResponse.Thumbnails thumbnails) {
        if (thumbnails == null) {
            return "";
        }
        if (thumbnails.medium() != null && thumbnails.medium().url() != null) {
            return thumbnails.medium().url();
        }
        if (thumbnails.high() != null && thumbnails.high().url() != null) {
            return thumbnails.high().url();
        }
        if (thumbnails.defaultThumb() != null && thumbnails.defaultThumb().url() != null) {
            return thumbnails.defaultThumb().url();
        }
        return "";
    }
}
