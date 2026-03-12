import com.zoho.cloud.function.Context;
import com.zoho.cloud.function.basic.*;

public class Java_TEST implements ZCFunction {
	public void runner(Context context, BasicIO basicIO) throws Exception {
		context.log("Log Data");
		basicIO.write("TestData");
	}
}