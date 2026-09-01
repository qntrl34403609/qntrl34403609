import com.zoho.cloud.function.Context;
import com.zoho.cloud.function.basic.*;

public class java_function implements ZCFunction {
	public void runner(Context context, BasicIO basicIO) throws Exception {
		context.log("Log Data");
		basicIO.write("TestData");
	}
}