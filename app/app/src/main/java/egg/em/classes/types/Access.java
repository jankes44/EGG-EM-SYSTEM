package egg.em.classes.types;

import android.os.Build;

import androidx.annotation.RequiresApi;

import java.util.Arrays;
import java.util.Optional;

public enum Access {
    DEVELOPER(99),
    USER(1),
    MODERATOR(2),
    ADMIN(3);

    private final int value;

    private Access(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    public static Optional<Access> valueOf(int v) {
        return Arrays.stream(values())
                .filter(a -> a.value == v)
                .findFirst();
    }

    public String asString(){
        String str = this.toString();
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

}
