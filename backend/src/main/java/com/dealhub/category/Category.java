package com.dealhub.category;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "parent_category_id")
    private Long parentCategoryId;

    protected Category() {
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Long getParentCategoryId() { return parentCategoryId; }
}
