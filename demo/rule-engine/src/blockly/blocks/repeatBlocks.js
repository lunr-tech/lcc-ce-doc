export function defineRepeatBlocks(Blockly) {

    // Define the CRON Schedule block
    Blockly.Blocks['cron_schedule'] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Repeat with CRON")
                .appendField(new Blockly.FieldTextInput("* * * * *"), "CRON_EXPR");
            this.appendStatementInput("DO")
                .setCheck(null)
                .appendField("do");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(120);
            this.setTooltip("Execute code on a schedule using CRON expression");
            this.setHelpUrl("");
        }
    };
}