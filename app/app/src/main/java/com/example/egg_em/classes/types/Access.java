package com.example.egg_em.classes.types;

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

}
