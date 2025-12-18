package com.example.ktb3team7hktbe.bias.controller;

import com.example.ktb3team7hktbe.bias.dto.ChatRequest;
import com.example.ktb3team7hktbe.bias.dto.ChatResponse;
import com.example.ktb3team7hktbe.bias.service.OllamaChatService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ChatController {
    private final OllamaChatService ollamaChatService;

    public ChatController(OllamaChatService ollamaChatService) {
        this.ollamaChatService = ollamaChatService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return ollamaChatService.send(request);
    }
}

