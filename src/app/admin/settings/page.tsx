"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Cài đặt</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Cài đặt
        </h1>
        <p className="text-muted-foreground mt-1">
          Cấu hình hệ thống và tùy chỉnh nền tảng MIRAI.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-12 bg-transparent p-0">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6"
          >
            Thông tin chung
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6"
          >
            Cấu hình AI
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6"
          >
            Thông báo
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <TabsContent value="general" className="space-y-6">
            <div className="rounded-md border border-border bg-background p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">
                Thông tin cửa hàng
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên cửa hàng</label>
                  <Input defaultValue="MIRAI - Custom Phone Cases" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email liên hệ</label>
                  <Input defaultValue="support@mirai.vn" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <Input defaultValue="1900 1234" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Đơn vị tiền tệ</label>
                  <Input defaultValue="VND (₫)" disabled />
                </div>
              </div>
              <Button className="mt-6">
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="rounded-md border border-border bg-background p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">
                API & Tích hợp Gemini
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gemini API Key</label>
                  <Input
                    type="password"
                    defaultValue="***********************************"
                  />
                  <p className="text-xs text-muted-foreground">
                    Khóa API dùng để tạo ảnh và xử lý prompt tiếng Việt.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Model</label>
                  <Input defaultValue="gemini-2.0-flash" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image Model</label>
                  <Input defaultValue="gemini-2.0-flash-preview-image-generation" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between">
                    <span>Mẫu System Prompt</span>
                  </label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="You are MIRAI's prompt engineer. Your job is to take a Vietnamese customer's casual description of a phone case design and transform it into a professional English prompt optimized for AI image generation."
                  />
                </div>
              </div>
              <Button className="mt-6">
                <Save className="h-4 w-4 mr-2" />
                Cập nhật cấu hình
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="rounded-md border border-border bg-background p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">
                Cài đặt Email & Thông báo
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Cấu hình các sự kiện sẽ gửi thông báo đến quản trị viên.
              </p>

              <div className="space-y-4">
                {[
                  "Có đơn hàng mới",
                  "Khách hàng yêu cầu hủy đơn",
                  "Đăng ký người dùng mới",
                  "Cảnh báo hệ thống (API lỗi, quá hạn ngạch)",
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`notif-${i}`}
                      defaultChecked={i !== 2}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`notif-${i}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
              <Button className="mt-8">
                <Save className="h-4 w-4 mr-2" />
                Lưu cấu hình
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
