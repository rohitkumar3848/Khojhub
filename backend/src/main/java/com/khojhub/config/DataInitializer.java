package com.khojhub.config;

import com.khojhub.model.embedded.DropLocationInfo;
import com.khojhub.model.embedded.LocationInfo;
import com.khojhub.model.embedded.VerificationQuestion;
import com.khojhub.model.entity.CustodyRecord;
import com.khojhub.model.entity.Item;
import com.khojhub.model.entity.User;
import com.khojhub.model.enums.CustodyStatus;
import com.khojhub.model.enums.ItemCategory;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.model.enums.ItemType;
import com.khojhub.model.enums.Role;
import com.khojhub.repository.CustodyRecordRepository;
import com.khojhub.repository.ItemRepository;
import com.khojhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final ItemRepository itemRepository;
        private final CustodyRecordRepository custodyRecordRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                try {
                        initUsersAndItems();
                } catch (Exception e) {
                        log.warn("Database initialization notice: {}", e.getMessage());
                }
        }

        private void initUsersAndItems() {
                // Ensure default Admin user exists
                if (!userRepository.existsByEmailIgnoreCase("admin@khojhub.com")) {
                        User admin = User.builder()
                                        .fullName("KhojHub Administrator")
                                        .email("admin@khojhub.com")
                                        .passwordHash(passwordEncoder.encode("Admin@123456"))
                                        .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER))
                                        .department("Campus Administration")
                                        .organization("KhojHub Central")
                                        .officeLocation("Main Building - Room 101")
                                        .status("ACTIVE")
                                        .karmaPoints(100)
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        userRepository.save(admin);
                        log.info("Initialized default administrator: admin@khojhub.com / Admin@123456");
                }

                // Ensure user Rohit exists
                User rohitUser = userRepository.findByEmailIgnoreCase("rohitkumar2003@gmail.com").orElse(null);
                if (rohitUser == null) {
                        rohitUser = User.builder()
                                        .fullName("Rohit Kumar")
                                        .email("rohitkumar2003@gmail.com")
                                        .passwordHash(passwordEncoder.encode("Rohit@2003"))
                                        .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER))
                                        .department("Engineering")
                                        .organization("Tech Campus")
                                        .officeLocation("Tower B - Floor 4")
                                        .status("ACTIVE")
                                        .karmaPoints(75)
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        rohitUser = userRepository.save(rohitUser);
                        log.info("Initialized user: rohitkumar2003@gmail.com / Rohit@2003");
                }

                // Demo user Rahul
                User rahulUser = userRepository.findByEmailIgnoreCase("rahul.verma@example.com").orElse(null);
                if (rahulUser == null) {
                        rahulUser = User.builder()
                                        .fullName("Rahul Verma")
                                        .email("rahul.verma@example.com")
                                        .passwordHash(passwordEncoder.encode("User@123456"))
                                        .roles(Set.of(Role.ROLE_USER))
                                        .department("Product Operations")
                                        .organization("Tech Campus")
                                        .officeLocation("Tower A - Floor 2")
                                        .status("ACTIVE")
                                        .karmaPoints(30)
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        rahulUser = userRepository.save(rahulUser);
                }

                // If items collection is empty, seed items matching the UI mockup
                if (itemRepository.count() == 0) {
                        log.info("Seeding initial Lost & Found items matching design mockups...");

                        // 1. Found iPhone 14
                        List<VerificationQuestion> iphoneQuestions = List.of(
                                        VerificationQuestion.builder().id(1)
                                                        .question("What is the lock screen wallpaper?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Mountain"))
                                                        .build(),
                                        VerificationQuestion.builder().id(2).question("What color is the phone case?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Black")).build(),
                                        VerificationQuestion.builder().id(3)
                                                        .question("What is the bluetooth device name first letter?")
                                                        .answerHash(VerificationQuestion.hashAnswer("R")).build(),
                                        VerificationQuestion.builder().id(4)
                                                        .question("Any scratch or mark on the screen?")
                                                        .answerHash(VerificationQuestion
                                                                        .hashAnswer("Small crack on top right"))
                                                        .build(),
                                        VerificationQuestion.builder().id(5).question("Which charger brand is with it?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Apple original"))
                                                        .build());

                        Item iphone14 = Item.builder()
                                        .title("iPhone 14")
                                        .description("Black iPhone found near cafeteria. Screen has a small crack on top right.")
                                        .type(ItemType.FOUND)
                                        .category(ItemCategory.ELECTRONICS)
                                        .location(LocationInfo.builder().city("Gurugram").campus("Cyber City")
                                                        .building("Tower B").floor("4").areaDetails("Cafeteria")
                                                        .build())
                                        .imageUrls(List.of(
                                                        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80"))
                                        .finderUserId(rahulUser.getId())
                                        .finderName(rahulUser.getFullName())
                                        .centralDropLocation(DropLocationInfo.builder()
                                                        .name("Tower B Ground Floor Reception").building("Tower B")
                                                        .floor("Ground").roomOrDesk("Main Reception Desk")
                                                        .instructions("Ask for Lost & Found box at security desk.")
                                                        .build())
                                        .status(ItemStatus.APPROVED)
                                        .verificationQuestions(iphoneQuestions)
                                        .eventDate("2026-09-22")
                                        .eventTime("14:30")
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        Item savedIphone = itemRepository.save(iphone14);

                        custodyRecordRepository.save(CustodyRecord.builder()
                                        .itemId(savedIphone.getId())
                                        .locationName("Tower B Ground Floor Reception")
                                        .status(CustodyStatus.STORED)
                                        .receivedAt(Instant.now())
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build());

                        // 2. Lost Black Wallet
                        Item wallet = Item.builder()
                                        .title("Black Wallet")
                                        .description("Brown/black leather wallet lost near conference room. Contains company ID and metro card.")
                                        .type(ItemType.LOST)
                                        .category(ItemCategory.WALLETS)
                                        .location(LocationInfo.builder().city("Gurugram").campus("Cyber City")
                                                        .building("Tower A").floor("3")
                                                        .areaDetails("Near Conference Room 302").build())
                                        .imageUrls(List.of(
                                                        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80"))
                                        .lostOwnerUserId(rohitUser.getId())
                                        .lostOwnerName(rohitUser.getFullName())
                                        .status(ItemStatus.ACTIVE)
                                        .eventDate("2026-09-20")
                                        .eventTime("11:15")
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        itemRepository.save(wallet);

                        // 3. Found Laptop Bag
                        List<VerificationQuestion> bagQuestions = List.of(
                                        VerificationQuestion.builder().id(1)
                                                        .question("What brand is printed on the bag?")
                                                        .answerHash(VerificationQuestion.hashAnswer("HP")).build(),
                                        VerificationQuestion.builder().id(2).question("What color is the zipper tag?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Blue")).build(),
                                        VerificationQuestion.builder().id(3).question("What is inside the front pouch?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Wireless mouse"))
                                                        .build(),
                                        VerificationQuestion.builder().id(4)
                                                        .question("Are there any keychain attachments?")
                                                        .answerHash(VerificationQuestion
                                                                        .hashAnswer("Aeroplane keychain"))
                                                        .build(),
                                        VerificationQuestion.builder().id(5).question("What size laptop fits inside?")
                                                        .answerHash(VerificationQuestion.hashAnswer("15 inch"))
                                                        .build());

                        Item laptopBag = Item.builder()
                                        .title("Laptop Bag")
                                        .description("Grey HP laptop bag with blue tag. Clean and in good condition.")
                                        .type(ItemType.FOUND)
                                        .category(ItemCategory.BAGS)
                                        .location(LocationInfo.builder().city("Gurugram").campus("Cyber City")
                                                        .building("Main Library").floor("Ground")
                                                        .areaDetails("Silent Study Zone").build())
                                        .imageUrls(List.of(
                                                        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"))
                                        .finderUserId(rohitUser.getId())
                                        .finderName(rohitUser.getFullName())
                                        .centralDropLocation(DropLocationInfo.builder().name("Main Library Help Desk")
                                                        .building("Library").floor("Ground")
                                                        .roomOrDesk("Circulation Desk")
                                                        .instructions("Stored with Library Assistant").build())
                                        .status(ItemStatus.APPROVED)
                                        .verificationQuestions(bagQuestions)
                                        .eventDate("2026-09-19")
                                        .eventTime("17:00")
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        Item savedBag = itemRepository.save(laptopBag);

                        custodyRecordRepository.save(CustodyRecord.builder()
                                        .itemId(savedBag.getId())
                                        .locationName("Main Library Help Desk")
                                        .status(CustodyStatus.STORED)
                                        .receivedAt(Instant.now())
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build());

                        // 4. Lost Office ID Card
                        Item idCard = Item.builder()
                                        .title("Office ID Card")
                                        .description("Employee ID card lost near cafeteria / elevator lobby.")
                                        .type(ItemType.LOST)
                                        .category(ItemCategory.DOCUMENTS_CARDS)
                                        .location(LocationInfo.builder().city("Gurugram").campus("Cyber City")
                                                        .building("Tower C").floor("2").areaDetails("Elevator lobby")
                                                        .build())
                                        .imageUrls(List.of(
                                                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80"))
                                        .lostOwnerUserId(rahulUser.getId())
                                        .lostOwnerName(rahulUser.getFullName())
                                        .status(ItemStatus.ACTIVE)
                                        .eventDate("2026-09-18")
                                        .eventTime("09:45")
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        itemRepository.save(idCard);

                        // 5. Pending Approval Item: AirPods Pro
                        List<VerificationQuestion> airpodsQuestions = List.of(
                                        VerificationQuestion.builder().id(1)
                                                        .question("What color is the silicone case?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Navy blue"))
                                                        .build(),
                                        VerificationQuestion.builder().id(2)
                                                        .question("Is there an engraved name on the case?")
                                                        .answerHash(VerificationQuestion.hashAnswer("No")).build(),
                                        VerificationQuestion.builder().id(3).question("What model is it?")
                                                        .answerHash(VerificationQuestion.hashAnswer("AirPods Pro 2"))
                                                        .build(),
                                        VerificationQuestion.builder().id(4).question("Are both ear pieces inside?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Yes")).build(),
                                        VerificationQuestion.builder().id(5)
                                                        .question("Any scratch on the charging case lid?")
                                                        .answerHash(VerificationQuestion.hashAnswer("Small scuff"))
                                                        .build());

                        Item airpods = Item.builder()
                                        .title("AirPods Pro")
                                        .description("White AirPods in navy case found near water cooler.")
                                        .type(ItemType.FOUND)
                                        .category(ItemCategory.ELECTRONICS)
                                        .location(LocationInfo.builder().city("Gurugram").campus("Cyber City")
                                                        .building("Tower B").floor("2").areaDetails("Near Water Cooler")
                                                        .build())
                                        .imageUrls(List.of(
                                                        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80"))
                                        .finderUserId(rahulUser.getId())
                                        .finderName(rahulUser.getFullName())
                                        .centralDropLocation(DropLocationInfo.builder()
                                                        .name("Tower B Ground Floor Reception").building("Tower B")
                                                        .floor("Ground").roomOrDesk("Desk")
                                                        .instructions("Submitted to security").build())
                                        .status(ItemStatus.PENDING_ADMIN_APPROVAL)
                                        .verificationQuestions(airpodsQuestions)
                                        .eventDate("2026-09-20")
                                        .eventTime("16:00")
                                        .createdAt(Instant.now())
                                        .updatedAt(Instant.now())
                                        .build();
                        itemRepository.save(airpods);

                        log.info("Sample items seeded successfully.");
                }
        }
}
