package egg.em.jetpack.activities.fragments;

import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.fragment.app.Fragment;

import com.example.egg_em.R;
import com.example.egg_em.classes.singletons.LoggedUser;

@RequiresApi(api = Build.VERSION_CODES.N)
public class UserProfileFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        LoggedUser user = LoggedUser.getInstance(null);

        View inflate = inflater.inflate(R.layout.user_profile_fragment, container, false);

        if (user != null){
            TextView firstName = inflate.findViewById(R.id.first_name_placeholder);
            firstName.setText(String.format(firstName.getText().toString(), user.getFirstName()));
            TextView lastName = inflate.findViewById(R.id.last_name_placeholder);
            lastName.setText(String.format(lastName.getText().toString(), user.getLastName()));
            TextView email = inflate.findViewById(R.id.email_placeholder);
            email.setText(String.format(email.getText().toString(), user.getEmail()));
            TextView accessRole = inflate.findViewById(R.id.access_role_placeholder);
            accessRole.setText(String.format(accessRole.getText().toString(), user.getAccess().asString()));
        }


        return inflate;
    }
}
