package com.khojhub.repository;

import com.khojhub.model.entity.Item;
import com.khojhub.model.enums.ItemCategory;
import com.khojhub.model.enums.ItemStatus;
import com.khojhub.model.enums.ItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<Item, String> {

    List<Item> findByStatus(ItemStatus status);

    List<Item> findByStatusIn(Collection<ItemStatus> statuses);

    List<Item> findByType(ItemType type);

    List<Item> findByTypeAndStatus(ItemType type, ItemStatus status);

    List<Item> findByTypeAndStatusIn(ItemType type, Collection<ItemStatus> statuses);

    List<Item> findByFinderUserId(String finderUserId);

    List<Item> findByLostOwnerUserId(String lostOwnerUserId);

    @Query("{ '$or': [ { 'finderUserId': ?0 }, { 'lostOwnerUserId': ?0 } ] }")
    List<Item> findMyPosts(String userId);

    List<Item> findByOriginalLostItemId(String originalLostItemId);

    long countByStatus(ItemStatus status);

    long countByType(ItemType type);

    long countByTypeAndStatus(ItemType type, ItemStatus status);

    @Query("{ 'status': { $in: ?0 }, '$or': [ { 'title': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } } ] }")
    List<Item> searchByStatusAndKeyword(Collection<ItemStatus> statuses, String keyword);
}
