module.exports = async function(context, basicIO)
{
	basicIO.write("test data");
	context.log.INFO("log data");
}