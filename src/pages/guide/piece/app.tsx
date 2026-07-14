import type { FC } from "react";
import { Stack, Typography, Card, CardContent } from "@mui/material";
import { Container } from "../../../components/utility";
import { ActionTable } from "../../../components/action_table";
import { PieceImage } from "../../../components/piece_image";
import { pieceRepository } from "../../../repository/piece";

const pieceOrder = [
  "rook",
  "bishop",
  "gold",
  "silver",
  "knight",
  "lance",
  "king",
  "dragon",
  "horse",
  "promotedSilver",
  "promotedKnight",
  "promotedLance",
  "pawn",
  "promotedPawn",
];

export const App: FC = () => (
  <Container backLink="/guide/">
    <Stack sx={{ p: 1 }}>
      <Typography variant="h4" sx={{ p: 1 }}>
        駒の一覧
      </Typography>
      {[...pieceRepository.all]
        .sort((a, b) => pieceOrder.indexOf(a.key) - pieceOrder.indexOf(b.key))
        .map((piece) => (
          <Card key={piece.key} sx={{ my: 1 }}>
            <CardContent>
              <Stack direction="row" sx={{ alignItems: "center", columnGap: 1 }}>
                <PieceImage pieceKey={piece.key} name={piece.name} size={40} />
                <Typography variant="h5">
                  {piece.name}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                    （{piece.shogiName}）
                  </Typography>
                </Typography>
              </Stack>
              <Typography sx={{ my: 1 }}>{piece.description}</Typography>
              <Typography variant="body2">
                最大HP: {piece.MaxHP} / 移動: {piece.move}
              </Typography>
              <ActionTable actions={piece.actions} />
            </CardContent>
          </Card>
        ))}
    </Stack>
  </Container>
);
