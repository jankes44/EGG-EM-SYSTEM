package egg.em.jetpack.activities;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Pair;
import android.widget.Button;
import android.widget.EditText;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.ExecutionException;

import egg.em.jetpack.R;

@RequiresApi(api = Build.VERSION_CODES.N)
public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login);

        final Button signupButton = findViewById(R.id.sign_in_button);
        signupButton.setOnClickListener((v) -> {
            Intent login = createIntent();
            if (login != null){
                startActivity(login);
                finish();
            }
        });
    }

    Intent createIntent(){
        Intent risIntent = null;

        EditText emailInput = findViewById(R.id.emailField);
        EditText passwordInput = findViewById(R.id.passwordField);

        String email = emailInput.getText().toString();
        String password = passwordInput.getText().toString();



}