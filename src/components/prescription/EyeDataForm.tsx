"use client";

import React from "react";
import { Form, Input, InputNumber } from "antd";

interface EyeDataFormProps {
  title: string;
  namePrefix: string;
  showFrameLens?: boolean;
  variant?: "default" | "highlight";
  stepNumber?: number;
}

// Full fields matching WPF: LK, S, C, A, ADD, TL, PD
const eyeFields = [
  { name: "lk", label: "LK" },
  { name: "sphere", label: "S" },
  { name: "cylinder", label: "C" },
  { name: "axis", label: "A" },
  { name: "addition", label: "ADD" },
  { name: "tl", label: "TL" },
  { name: "pd", label: "PD" },
];

export default function EyeDataForm({
  title,
  namePrefix,
  showFrameLens,
  variant = "default",
  stepNumber,
}: EyeDataFormProps) {
  const isHighlight = variant === "highlight";

  return (
    <div
      className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${
        isHighlight
          ? "border-blue-200 ring-2 ring-blue-100"
          : "border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {stepNumber && (
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                isHighlight
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-white"
              }`}
            >
              {stepNumber}
            </span>
          )}
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        {isHighlight && (
          <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase rounded-full">
            Đơn chỉ định
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Right Eye (OD) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm font-bold text-slate-600 uppercase">
                Mắt Phải (Right Eye)
              </span>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {eyeFields.map((field) => (
                <div key={`right_${field.name}`} className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">
                    {field.label}
                  </label>
                  <Form.Item name={[namePrefix, `right_${field.name}`]} noStyle>
                    <Input
                      placeholder="-"
                      className="!rounded-md !border-slate-300 !text-center !text-sm !px-2 !py-1.5 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500"
                    />
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>

          {/* Left Eye (OS) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm font-bold text-slate-600 uppercase">
                Mắt Trái (Left Eye)
              </span>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {eyeFields.map((field) => (
                <div key={`left_${field.name}`} className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">
                    {field.label}
                  </label>
                  <Form.Item name={[namePrefix, `left_${field.name}`]} noStyle>
                    <Input
                      placeholder="-"
                      className="!rounded-md !border-slate-300 !text-center !text-sm !px-2 !py-1.5 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500"
                    />
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Frame & Lens Section */}
        {showFrameLens && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-medium">
                  👓 TÊN GỌNG
                </label>
                <Form.Item name={[namePrefix, "frame_name"]} noStyle>
                  <Input
                    placeholder="Nhập tên gọng"
                    className="!rounded-md !border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-medium">
                  💰 GIÁ GỌNG (VNĐ)
                </label>
                <Form.Item name={[namePrefix, "frame_price"]} noStyle>
                  <InputNumber
                    placeholder="0"
                    className="!w-full !rounded-md !border-slate-300"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      value?.replace(/\$\s?|(,*)/g, "") as unknown as number
                    }
                  />
                </Form.Item>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-medium">
                  🔍 TÊN TRÒNG
                </label>
                <Form.Item name={[namePrefix, "lense_name"]} noStyle>
                  <Input
                    placeholder="Nhập tên tròng"
                    className="!rounded-md !border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-medium">
                  💰 GIÁ TRÒNG (VNĐ)
                </label>
                <Form.Item name={[namePrefix, "lense_price"]} noStyle>
                  <InputNumber
                    placeholder="0"
                    className="!w-full !rounded-md !border-slate-300"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) =>
                      value?.replace(/\$\s?|(,*)/g, "") as unknown as number
                    }
                  />
                </Form.Item>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-medium">
                📝 GHI CHÚ CHỈ ĐỊNH
              </label>
              <Form.Item name={[namePrefix, "description"]} noStyle>
                <Input.TextArea
                  placeholder="Nhập lưu ý cho kỹ thuật viên..."
                  rows={2}
                  className="!rounded-md !border-slate-300"
                />
              </Form.Item>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
