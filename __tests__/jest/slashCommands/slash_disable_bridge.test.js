const { execute } = require("../../../src/discordBot/commands/faculty/disable_bridge");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { findChannelFromDbByName, findCourseFromDb, isCourseCategory } = require("../../../src/discordBot/services/service");

const models = require("../../mocks/mockModels");
jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");
const initalResponse = "Disabling the bridge to Telegram...";
const channelModelInstanceMock = { save: jest.fn(), bridged: true };

findChannelFromDbByName
  .mockImplementation(() => ({ bridged: false }))
  .mockImplementationOnce(() => null)
  .mockImplementationOnce(() => channelModelInstanceMock);

findCourseFromDb.mockImplementation(() => ({ telegramId: 1 }));

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash disable_bridge command", () => {
  test("Cannot use command on non-course channels", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "This is not a course category, can not execute the command!";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Cannot use command on default course channels", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 3;
    const response = "Command can't be performed on default course channels!";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Correct channel can be disabled", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 3;
    const response = "The bridge between this channel and Telegram is now disabled.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("Disabling a channel that is already disabled responds with correct error ephemeral", async () => {
    isCourseCategory.mockImplementationOnce(() => (true));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 3;
    const response = "The bridge is already disabled on this channel.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findChannelFromDbByName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initalResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});