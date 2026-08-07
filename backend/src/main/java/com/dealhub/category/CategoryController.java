package com.dealhub.category;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CategoryController {

    private final CategoryRepository categories;

    public CategoryController(CategoryRepository categories) {
        this.categories = categories;
    }

    public record CategoryNode(Long id, String name, List<CategoryNode> subcategories) {
    }

    @GetMapping("/categories")
    public List<CategoryNode> tree() {
        List<Category> all = categories.findAllByOrderByNameAsc();
        return all.stream()
                .filter(c -> c.getParentCategoryId() == null)
                .map(parent -> new CategoryNode(parent.getId(), parent.getName(),
                        all.stream()
                                .filter(c -> parent.getId().equals(c.getParentCategoryId()))
                                .map(c -> new CategoryNode(c.getId(), c.getName(), List.of()))
                                .toList()))
                .toList();
    }
}
