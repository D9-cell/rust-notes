use ch06_machine::*;

#[test]
fn light_cycles_through_three_states() {
    assert_eq!(Light::Red.next(), Light::Green);
    assert_eq!(Light::Green.next(), Light::Yellow);
    assert_eq!(Light::Yellow.next(), Light::Red);
}

#[test]
fn each_light_has_a_duration() {
    assert_eq!(Light::Red.seconds(), 30);
    assert_eq!(Light::Green.seconds(), 25);
    assert_eq!(Light::Yellow.seconds(), 5);
}

#[test]
fn parses_simple_commands() {
    assert_eq!(parse_command("go"), Some(Command::Go));
    assert_eq!(parse_command("stop"), Some(Command::Stop));
}

#[test]
fn parses_commands_with_arguments() {
    assert_eq!(parse_command("wait 7"), Some(Command::Wait(7)));
    assert_eq!(parse_command("say hello world"), Some(Command::Say("hello world".to_string())));
}

#[test]
fn rejects_bad_input() {
    assert_eq!(parse_command(""), None);
    assert_eq!(parse_command("dance"), None);
    assert_eq!(parse_command("wait"), None);
    assert_eq!(parse_command("wait soon"), None);
    assert_eq!(parse_command("say"), None);
}

#[test]
fn apply_changes_the_light() {
    assert_eq!(apply(Light::Red, &Command::Go), Light::Green);
    assert_eq!(apply(Light::Green, &Command::Stop), Light::Red);
    assert_eq!(apply(Light::Yellow, &Command::Wait(3)), Light::Yellow);
    assert_eq!(apply(Light::Yellow, &Command::Say("hi".into())), Light::Yellow);
}

#[test]
fn total_wait_sums_only_waits() {
    let cmds = vec![Command::Wait(3), Command::Go, Command::Wait(4), Command::Say("x".into())];
    assert_eq!(total_wait(&cmds), 7);
    assert_eq!(total_wait(&[]), 0);
}
