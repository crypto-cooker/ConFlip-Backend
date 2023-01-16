CREATE TABLE rounds (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER NOT NULL,
    flip_type INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL,
    amount FLOAT NOT NULL,
    result VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(255) NOT NULL,
    signature VARCHAR(255) NOT NULL,
	CONSTRAINT "walletId" FOREIGN KEY ("wallet_id")
		REFERENCES "auth_wallets" ("id") MATCH SIMPLE
);