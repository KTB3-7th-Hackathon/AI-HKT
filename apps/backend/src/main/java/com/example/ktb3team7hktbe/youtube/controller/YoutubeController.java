package com.example.ktb3team7hktbe.youtube.controller;

import com.example.ktb3team7hktbe.youtube.dto.YoutubeVideo;
import com.example.ktb3team7hktbe.youtube.service.YoutubeSearchService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/youtube")
@CrossOrigin(origins = "http://localhost:5173")
public class YoutubeController {
    private final YoutubeSearchService youtubeSearchService;

    public YoutubeController(YoutubeSearchService youtubeSearchService) {
        this.youtubeSearchService = youtubeSearchService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<YoutubeVideo>> search(@RequestParam("query") String query) {
        return ResponseEntity.ok(youtubeSearchService.search(query));
    }
}
