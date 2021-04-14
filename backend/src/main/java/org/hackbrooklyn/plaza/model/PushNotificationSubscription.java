package org.hackbrooklyn.plaza.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.jce.spec.ECPublicKeySpec;
import org.bouncycastle.math.ec.ECPoint;
import org.hibernate.validator.constraints.URL;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

@Entity
@Table(name = "push_notification_subscriptions")
@Getter
@Setter
@RequiredArgsConstructor
public class PushNotificationSubscription {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "subscribed_user_id", referencedColumnName = "id")
    @NotNull
    private User subscribedUser;

    @Column(name = "endpoint")
    @URL
    @NotBlank
    @NotNull
    private String endpoint;

    @Column(name = "key")
    @NotBlank
    @NotNull
    private String key;

    @Column(name = "auth")
    @NotBlank
    @NotNull
    private String auth;

    public PublicKey getUserPublicKey() throws NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException {
        KeyFactory factory = KeyFactory.getInstance("ECDH", BouncyCastleProvider.PROVIDER_NAME);
        byte[] keyBytes = Base64.getDecoder().decode(getKey());

        ECNamedCurveParameterSpec ecSpec = ECNamedCurveTable.getParameterSpec("secp256r1");
        ECPoint point = ecSpec.getCurve().decodePoint(keyBytes);
        ECPublicKeySpec pubSpec = new ECPublicKeySpec(point, ecSpec);

        return factory.generatePublic(pubSpec);
    }

    public byte[] getAuthAsBytes() {
        return Base64.getDecoder().decode(getAuth());
    }
}
