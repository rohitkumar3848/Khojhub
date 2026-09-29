package com.khojhub.service;

import com.khojhub.dto.request.AnswerSubmissionDto;
import com.khojhub.dto.request.ClaimSubmitRequest;
import com.khojhub.dto.response.ClaimResponse;
import com.khojhub.exception.ForbiddenException;
import com.khojhub.model.embedded.VerificationQuestion;
import com.khojhub.model.entity.ChatConversation;
import com.khojhub.model.entity.Claim;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.ClaimStatus;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.model.enums.ItemType;
import com.khojhub.repository.ClaimRepository;
import com.khojhub.repository.CustodyRecordRepository;
import com.khojhub.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private CustodyRecordRepository custodyRecordRepository;

    @Mock
    private ChatService chatService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ClaimService claimService;

    private Item testItem;
    private User claimant;
    private User finder;

    @BeforeEach
    void setUp() {
        finder = User.builder().id("finder-1").fullName("Finder User").email("finder@example.com").build();
        claimant = User.builder().id("claimant-1").fullName("Claimant User").email("claimant@example.com").build();

        List<VerificationQuestion> questions = List.of(
                VerificationQuestion.builder().id(1).question("Q1").answerHash(VerificationQuestion.hashAnswer("Blue")).build(),
                VerificationQuestion.builder().id(2).question("Q2").answerHash(VerificationQuestion.hashAnswer("Mountain")).build(),
                VerificationQuestion.builder().id(3).question("Q3").answerHash(VerificationQuestion.hashAnswer("128GB")).build(),
                VerificationQuestion.builder().id(4).question("Q4").answerHash(VerificationQuestion.hashAnswer("Sticker")).build(),
                VerificationQuestion.builder().id(5).question("Q5").answerHash(VerificationQuestion.hashAnswer("Case")).build()
        );

        testItem = Item.builder()
                .id("item-101")
                .title("Blue Smartphone")
                .type(ItemType.FOUND)
                .status(ItemStatus.APPROVED)
                .finderUserId(finder.getId())
                .finderName(finder.getFullName())
                .verificationQuestions(questions)
                .build();
    }

    @Test
    @DisplayName("Claimant scoring 3 out of 5 passes verification and initiates chat")
    void testQuizPassesWithThreeCorrectAnswers() {
        when(itemRepository.findById("item-101")).thenReturn(Optional.of(testItem));
        when(claimRepository.findByItemId("item-101")).thenReturn(List.of());
        when(claimRepository.findByItemIdAndClaimantUserId("item-101", claimant.getId())).thenReturn(Optional.empty());

        ChatConversation conv = ChatConversation.builder().id("conv-1").build();
        when(chatService.getOrCreateConversation(any(), any(), any(), any())).thenReturn(conv);

        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> {
            Claim c = invocation.getArgument(0);
            c.setId("claim-1");
            return c;
        });

        // 3 correct, 2 wrong
        ClaimSubmitRequest request = ClaimSubmitRequest.builder()
                .answers(List.of(
                        AnswerSubmissionDto.builder().questionId(1).answer("Blue").build(),        // Correct
                        AnswerSubmissionDto.builder().questionId(2).answer("Mountain").build(),    // Correct
                        AnswerSubmissionDto.builder().questionId(3).answer("128GB").build(),       // Correct
                        AnswerSubmissionDto.builder().questionId(4).answer("Wrong answer").build(),// Wrong
                        AnswerSubmissionDto.builder().questionId(5).answer("Wrong answer").build() // Wrong
                ))
                .build();

        ClaimResponse response = claimService.submitClaim("item-101", request, claimant);

        assertNotNull(response);
        assertEquals(3, response.getScore());
        assertEquals(ClaimStatus.CHAT_ACTIVE, response.getStatus());
        assertEquals("conv-1", response.getConversationId());
        verify(notificationService, times(1)).sendNotification(eq(finder.getId()), any(), any(), eq("CLAIM_QUIZ_PASSED"), any());
    }

    @Test
    @DisplayName("Claimant scoring 2 out of 5 fails verification")
    void testQuizFailsWithTwoCorrectAnswers() {
        when(itemRepository.findById("item-101")).thenReturn(Optional.of(testItem));
        when(claimRepository.findByItemId("item-101")).thenReturn(List.of());
        when(claimRepository.findByItemIdAndClaimantUserId("item-101", claimant.getId())).thenReturn(Optional.empty());

        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> {
            Claim c = invocation.getArgument(0);
            c.setId("claim-2");
            return c;
        });

        // 2 correct, 3 wrong
        ClaimSubmitRequest request = ClaimSubmitRequest.builder()
                .answers(List.of(
                        AnswerSubmissionDto.builder().questionId(1).answer("Blue").build(),        // Correct
                        AnswerSubmissionDto.builder().questionId(2).answer("Mountain").build(),    // Correct
                        AnswerSubmissionDto.builder().questionId(3).answer("Wrong").build(),       // Wrong
                        AnswerSubmissionDto.builder().questionId(4).answer("Wrong").build(),       // Wrong
                        AnswerSubmissionDto.builder().questionId(5).answer("Wrong").build()        // Wrong
                ))
                .build();

        ClaimResponse response = claimService.submitClaim("item-101", request, claimant);

        assertNotNull(response);
        assertEquals(2, response.getScore());
        assertEquals(ClaimStatus.QUIZ_FAILED, response.getStatus());
        assertNull(response.getConversationId());
        verify(chatService, never()).getOrCreateConversation(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Finder cannot claim their own found item")
    void testFinderCannotClaimOwnItem() {
        when(itemRepository.findById("item-101")).thenReturn(Optional.of(testItem));

        ClaimSubmitRequest request = ClaimSubmitRequest.builder()
                .answers(List.of(
                        AnswerSubmissionDto.builder().questionId(1).answer("Blue").build()
                ))
                .build();

        assertThrows(ForbiddenException.class, () -> claimService.submitClaim("item-101", request, finder));
    }
}
