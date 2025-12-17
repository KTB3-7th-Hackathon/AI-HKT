package com.example.ktb3team7hktbe.bias.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OppositeVideos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "url", nullable = false)
    String url;

    @Column(name = "tag", nullable = false)
    String tag;

    @Column(name = "bias", nullable = false)
    int bias;
}
