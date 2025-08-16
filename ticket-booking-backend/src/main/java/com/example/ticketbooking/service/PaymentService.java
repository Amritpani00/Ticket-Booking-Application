package com.example.ticketbooking.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${app.payment.razorpay.key-id}")
    private String keyId;

    @Value("${app.payment.razorpay.key-secret}")
    private String keySecret;

    @Value("${app.payment.razorpay.currency:INR}")
    private String currency;

    @Value("${app.payment.razorpay.enabled:false}")
    private boolean enabled;

    private RazorpayClient ensureClient() throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    public Order createOrder(long amountInPaise, String receiptId) throws Exception {
        if (!enabled) {
            JSONObject fake = new JSONObject();
            fake.put("id", "order_test_" + receiptId);
            fake.put("amount", amountInPaise);
            fake.put("currency", currency);
            return new Order(fake);
        }
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receiptId);
        orderRequest.put("payment_capture", 1);
        return ensureClient().orders.create(orderRequest);
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) throws Exception {
        if (!enabled) {
            return true;
        }
        String payload = orderId + '|' + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] hmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hmac) {
            sb.append(String.format("%02x", b));
        }
        String expected = sb.toString();
        return expected.equals(signature);
    }

    public String getKeyId() {
        return keyId;
    }
}