"use client";

import { useMutation, useSuspenseQuery } from "@apollo/client";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/system";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { Params } from "../../params";
import GetEventDetailsQuery from "../GetEventDetails.graphql";
import CreateSetDiscountMutation from "./CreateSetDiscount.graphql";
import DeleteDiscountMutation from "./DeleteDiscount.graphql";
import { useAlert } from "@/app/(web)/Alert";
import { assertSuccess } from "@/app/(web)/Apollo";
import type { CreateSetDiscount } from "@/generated/schema";

export default function Discounts({ params }: { params: Params }) {
  const { data } = useSuspenseQuery(GetEventDetailsQuery, {
    variables: params,
    fetchPolicy: "cache-and-network",
  });
  const { me } = data.event.guild;

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "2em" }}>
        割引等
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {data.event.discounts.map((discounts) => (
          <Discount
            me={me}
            displays={data.event.displays}
            discount={discounts}
            key={discounts.id}
          />
        ))}
      </Box>
      <CreateDiscount me={me} displays={data.event.displays} />
    </>
  );
}

function Discount({
  me,
  displays,
  discount,
}: {
  me: { write: boolean };
  displays: {
    item: { id: string; name: string };
    price: number;
  }[];
  discount: {
    __typename: "SetDiscount";
    id: string;
    itemIds: string[];
    amount: number;
  };
}) {
  switch (discount.__typename) {
    case "SetDiscount": {
      const setDisplays = discount.itemIds.map((id) =>
        displays.find(({ item }) => item.id === id),
      );
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <Typography variant="body1" sx={{ flex: 1 }}>
            セット割引
          </Typography>
          <Typography variant="body1" sx={{ flex: 1 }}>
            {setDisplays
              .map((discount) => (discount ? discount.item.name : "不明"))
              .join(" + ")}
            = ¥
            {setDisplays.reduce(
              (sum, display) => sum + (display ? display.price : 0),
              -discount.amount,
            )}
          </Typography>
          <Typography variant="body1" sx={{ flex: 1 }}>
            {discount.amount}円引き
          </Typography>
          <Box sx={{ flex: 1 }}>
            <DeleteDiscountButton me={me} discount={discount} />
          </Box>
        </Box>
      );
    }
  }
}

function DeleteDiscountButton({
  me,
  discount,
}: {
  me: { write: boolean };
  discount: { id: string };
}) {
  const params = useParams<Params>();
  const { success, error } = useAlert();
  const [trigger, { loading }] = useMutation(DeleteDiscountMutation, {
    refetchQueries: [{ query: GetEventDetailsQuery, variables: params }],
  });

  async function onClick() {
    try {
      const result = await trigger({
        variables: { ...params, id: discount.id },
      });
      assertSuccess(result);
      success("割引を削除しました");
    } catch {
      error("割引の削除に失敗しました");
    }
  }

  return (
    <LoadingButton
      variant="outlined"
      loading={loading}
      color="error"
      onClick={onClick}
      disabled={!me.write}
    >
      削除
    </LoadingButton>
  );
}

type CreateDiscount = CreateSetDiscount & {
  __typename: "SetDiscount";
};

function CreateDiscount({
  me,
  displays,
}: {
  me: { write: boolean };
  displays: {
    item: { id: string; name: string };
  }[];
}) {
  const [type, setType] = useState<"SetDiscount">();

  switch (type) {
    case "SetDiscount": {
      return (
        <CreateSetDiscount
          onClose={() => setType(undefined)}
          displays={displays}
        />
      );
    }
    default: {
      return (
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
          <Button
            variant="outlined"
            disabled={!me.write}
            onClick={() => setType("SetDiscount")}
          >
            セット割引を追加
          </Button>
        </Box>
      );
    }
  }
}

function CreateSetDiscount({
  onClose,
  displays,
}: {
  onClose: () => void;
  displays: {
    item: { id: string; name: string };
  }[];
}) {
  const params = useParams<Params>();
  const [amount, setAmount] = useState(0);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const { success, error } = useAlert();
  const [trigger, { loading }] = useMutation(CreateSetDiscountMutation, {
    refetchQueries: [{ query: GetEventDetailsQuery, variables: params }],
  });

  async function onClick() {
    try {
      const result = await trigger({
        variables: {
          ...params,
          input: { itemIds, amount },
        },
      });
      assertSuccess(result);
      success("割引を保存しました");
      onClose();
    } catch {
      error("割引の保存に失敗しました");
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
      }}
    >
      <FormControl sx={{ width: 300 }}>
        <InputLabel>商品の組み合わせ</InputLabel>
        <Select
          label="商品の組み合わせ"
          multiple
          value={itemIds}
          onChange={({ target: { value } }) =>
            setItemIds(typeof value === "string" ? value.split(",") : value)
          }
        >
          {displays.map(({ item }) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="割引額"
        type="number"
        required
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
        InputProps={{
          startAdornment: <InputAdornment position="start">¥</InputAdornment>,
        }}
        sx={{ width: "8em" }}
      />
      <Button onClick={onClose}>キャンセル</Button>
      <LoadingButton
        loading={loading}
        variant="contained"
        disabled={amount === 0 || itemIds.length === 0}
        onClick={onClick}
      >
        保存
      </LoadingButton>
    </Box>
  );
}
