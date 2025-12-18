package com.example.ktb3team7hktbe.youtube.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record YoutubeSearchApiResponse(List<Item> items) {
    public record Item(Id id, Snippet snippet) {}

    public record Id(String videoId) {}

    public record Snippet(String title, String channelTitle, Thumbnails thumbnails) {}

    public record Thumbnails(
            Thumbnail medium,
            Thumbnail high,
            @JsonProperty("default") Thumbnail defaultThumb
    ) {}

    public record Thumbnail(String url) {}
}
