package com.khojhub.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationQuestion {

    private Integer id;
    private String question;
    private String answerHash;

    /**
     * Hashes an answer using normalized lowercase string with SHA-256
     */
    public static String hashAnswer(String answer) {
        if (answer == null) return "";
        String normalized = answer.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    /**
     * Validates if the claimant's answer matches the recorded hash.
     */
    public boolean checkAnswer(String rawAnswer) {
        if (rawAnswer == null || this.answerHash == null) {
            return false;
        }
        String claimantHash = hashAnswer(rawAnswer);
        return this.answerHash.equalsIgnoreCase(claimantHash);
    }
}
