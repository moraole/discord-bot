/**
 * Returns list of commands needing some work to be done.
 *
 * @param {string} 
 * @return {string} message.channel.send() .
 */
function toDo(message) {
    return message.channel.send(
    `   ** Answer only display **
          // Get image element?
            -- if multiple images found => get multiple images.
                => Look for stop point.
          // Get image through screenshot?
            -- Scroll down till reaching a certain element.
            // Post multiple screenshots?
            -- Clear up images.
                => set zoom variable, (perhaps in a command for the user.)
        - Add other commands
        * Implement everything else in -chegg help command.
        - Figure out how to make bot DM Users.
        * DM users chegg images to avoid spam in channels. Another option would be to
        constantly clear chat using bot.
    `)
}