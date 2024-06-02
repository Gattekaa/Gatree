import Tooltip from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getTreeQRCode } from "@/requests/trees";
import type { Tree } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { CloudOff, Download, QrCodeIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface QRCodeButtonProps {
  tree: Tree;
}

export default function QRCodeButton({ tree }: QRCodeButtonProps) {
  const [QrCodeTree, setQrCodeTree] = useState<Tree>({} as Tree)

  function QrCode() {
    const { data: qrCode, error: qrCodeError, isPending: isQrCodeLoading } = useQuery({
      queryKey: ["qrcode", QrCodeTree],
      queryFn: () => getTreeQRCode(QrCodeTree.id),
      enabled: !!QrCodeTree.id,
    })

    function handleDownload() {
      const downloadLink = document.createElement('a');
      downloadLink.href = qrCode;
      downloadLink.download = 'qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    return (
      <Dialog open={!!QrCodeTree.id} onOpenChange={() => setQrCodeTree({} as Tree)}>
        <DialogContent className="flex justify-center items-center w-fit h-fit">
          <Card className="w-[350px] border-0">

            <CardHeader>
              {
                isQrCodeLoading ? (
                  <Skeleton className="w-28 h-8" />
                ) : (
                  <CardTitle>QRCode</CardTitle>
                )
              }
              {
                isQrCodeLoading ? (
                  <Skeleton className="w-full h-6" />
                ) : (
                  <CardDescription>
                    Use the following QRCode to share your tree
                  </CardDescription>
                )
              }
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {
                isQrCodeLoading && <Skeleton className="w-[400px] h-[300px]" />
              }
              {
                !isQrCodeLoading && qrCode && (
                  <Tooltip delay={100} text="Click to download QRCode image">
                    <div className="relative group">
                      <Button
                        className="absolute top-0 left-0 w-full h-full hover:backdrop-blur-sm !bg-transparent !rounded-none hover:!bg-slate-950/50 opacity-0 hover:opacity-100 duration-150"
                        onClick={handleDownload}
                        variant="ghost"
                      >
                        <Download size={64} className="animate-bounce" />
                      </Button>
                      <Image
                        src={qrCode}
                        width={400}
                        height={400}
                        alt="QRCode"
                      />
                    </div>
                  </Tooltip>
                )
              }
              {
                !isQrCodeLoading && qrCodeError && (
                  <div className="flex flex-col justify-center items-center text-center gap-4 mt-4">
                    <CloudOff size={64} className="text-slate-400" />
                    <p className="text-slate-400">An error occurred while fetching the QRCode. Please try again later.</p>
                  </div>
                )
              }
            </CardContent>

          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <QrCode />
      <Tooltip text="Generate QRCode" side="left">
        <Button
          className="text-slate-400 w-8 h-8 text-sm rounded-full z-10"
          onClick={() => setQrCodeTree(tree)}
          variant="outline"
          size="icon"
        >
          <QrCodeIcon size={14} />
        </Button>
      </Tooltip>
    </>
  )
}