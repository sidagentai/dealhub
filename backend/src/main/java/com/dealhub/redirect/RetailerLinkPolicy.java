package com.dealhub.redirect;

import jakarta.persistence.*;

@Entity
@Table(name = "retailer_link_policies")
public class RetailerLinkPolicy {

    public static final String POLICY_REDIRECT = "redirect";
    public static final String POLICY_DIRECT_WITH_PARAM = "direct_with_param";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "retailer_name", nullable = false, length = 100)
    private String retailerName;

    @Column(nullable = false, length = 20)
    private String policy;

    @Column(name = "param_template", length = 500)
    private String paramTemplate;

    @Column(length = 1000)
    private String notes;

    protected RetailerLinkPolicy() {
    }

    public String getRetailerName() { return retailerName; }
    public String getPolicy() { return policy; }
    public String getParamTemplate() { return paramTemplate; }
}
