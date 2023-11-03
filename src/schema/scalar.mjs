import { GraphQLSchema } from "graphql";
import { DateTimeResolver, DateResolver } from "graphql-scalars";

const schema = new GraphQLSchema({
  types: [DateTimeResolver, DateResolver],
});
export default schema;
