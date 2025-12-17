package com.example.ktb3team7hktbe.bias.repository;

import com.example.ktb3team7hktbe.bias.entity.OppositeVideos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OppositeVideosRepository extends JpaRepository<OppositeVideos, Long> {
    List<OppositeVideos> findFirst2ByTagAndBiasBetween(String tag, int minBias, int maxBias);
}
