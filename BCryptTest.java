import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String[] pwds = {"john1234", "jane456", "emp789", "admin000", "audit999", "roshni111"};
        for (String p : pwds) {
            System.out.println(p + " -> " + encoder.encode(p));
        }
    }
}
