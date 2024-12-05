import { Authenticator } from './authenticator';
import { InMemoryUserRepository } from '../adapters/user-repository.in-memory';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../ports/user-repository.interface';

describe("Authenticator", () => {
  let repository: IUserRepository;
  let authenticator: Authenticator;

  beforeEach(async () => {
    repository = new InMemoryUserRepository();
    await repository.create(new User(
      {id: "1", emailAddress: "j.doe@example.fr", password: "azerty"}
    ));
    authenticator = new Authenticator(repository);
  })

  describe("Case: the token is valid", () => {
    it('should authenticate the user', async () => {
      const payload = Buffer.from("j.doe@example.fr:azerty").toString("base64");
      const user = await authenticator.authenticate(payload);

      expect(user.props).toEqual({
        id: "1",
        emailAddress: "j.doe@example.fr",
        password: "azerty",
      });
    });
  });

  describe("Case: the token is invalid", () => {
    it('should fail if the user does not exists', async () => {
      const payload = Buffer.from("jane.doe@example.fr:azerty").toString("base64");

      await expect(
        () => authenticator.authenticate(payload)
      ).rejects.toThrow("User not found");
    });

    it('should fail if the password is invalid', async () => {
      const payload = Buffer.from("j.doe@example.fr:invalid").toString("base64");

      await expect(
        () => authenticator.authenticate(payload)
      ).rejects.toThrow("Password is invalid");
    });
  })
})