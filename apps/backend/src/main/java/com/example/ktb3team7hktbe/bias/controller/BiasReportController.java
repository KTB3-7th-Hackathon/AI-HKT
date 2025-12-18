package com.example.ktb3team7hktbe.bias.controller;

import com.example.ktb3team7hktbe.bias.dto.ReportResponse;
import com.example.ktb3team7hktbe.bias.dto.TranscriptRequest;
import com.example.ktb3team7hktbe.bias.service.BiasReportService;
import com.example.ktb3team7hktbe.bias.service.ReportViewAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = "http://localhost:5173")
public class BiasReportController {

    private final BiasReportService biasReportService;
    private final ReportViewAssembler reportViewAssembler;

    public BiasReportController(BiasReportService biasReportService, ReportViewAssembler reportViewAssembler) {
        this.biasReportService = biasReportService;
        this.reportViewAssembler = reportViewAssembler;
    }

    @PostMapping
    public ResponseEntity<ReportResponse> analyze(@RequestBody TranscriptRequest request) {

        ReportResponse report = reportViewAssembler.processingReport(biasReportService.analyzeVideo(request));

        return ResponseEntity.ok(report);
    }
}
